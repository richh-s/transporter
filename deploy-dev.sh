#!/bin/bash
# Build, push, and deploy transporter to dev App Runner
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="577638353021"
ECR_REPO_NAME="backend-dev"
SERVICE_NAME="transporter-dev"
IMAGE_TAG="${1:-transporter-dev-$(date +%Y%m%d-%H%M%S)}"
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
ECR_IMAGE="${ECR_REPO_URI}:${IMAGE_TAG}"

echo "Step 1: Building Docker image..."
docker build --build-arg NEXT_PUBLIC_API_URL=https://dev-api.wetruck.ai/api/v1 -t transporter:${IMAGE_TAG} .

echo "Step 2: Tagging for ECR..."
docker tag transporter:${IMAGE_TAG} ${ECR_IMAGE}

echo "Step 3: Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO_URI}

echo "Step 4: Pushing to ECR..."
docker push ${ECR_IMAGE}

echo "Step 5: Checking if App Runner service exists..."
SERVICE_ARN=$(aws apprunner list-services --region ${AWS_REGION} --output json | jq -r --arg n "${SERVICE_NAME}" '.ServiceSummaryList[] | select(.ServiceName == $n) | .ServiceArn')

if [ -z "$SERVICE_ARN" ] || [ "$SERVICE_ARN" = "null" ]; then
  echo "Service '${SERVICE_NAME}' not found. Creating new service..."
  
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/AppRunnerECRAccess-transporter-dev"
  
  # Create the service
  aws apprunner create-service \
    --service-name "${SERVICE_NAME}" \
    --source-configuration "{
      \"ImageRepository\": {
        \"ImageIdentifier\": \"${ECR_IMAGE}\",
        \"ImageRepositoryType\": \"ECR\",
        \"ImageConfiguration\": {
          \"Port\": \"3000\",
          \"RuntimeEnvironmentVariables\": {
            \"NEXT_PUBLIC_API_URL\": \"https://dev-api.wetruck.ai/api/v1\"
          }
        }
      },
      \"AuthenticationConfiguration\": {
        \"AccessRoleArn\": \"${ROLE_ARN}\"
      }
    }" \
    --instance-configuration "{
      \"Cpu\": \"1 vCPU\",
      \"Memory\": \"2 GB\"
    }" \
    --health-check-configuration "{
      \"Protocol\": \"HTTP\",
      \"Path\": \"/\",
      \"Interval\": 10,
      \"Timeout\": 5,
      \"HealthyThreshold\": 1,
      \"UnhealthyThreshold\": 5
    }" \
    --region ${AWS_REGION} \
    --output json | jq '{ OperationId, Service: { ServiceName: .Service.ServiceName, Status: .Service.Status, ServiceUrl: .Service.ServiceUrl } }'
  
  echo ""
  echo "Service creation initiated! Image: ${ECR_IMAGE}"
else
  echo "Step 6: Updating App Runner service with new image..."
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/AppRunnerECRAccess-transporter-dev"

  CURRENT=$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --region "$AWS_REGION" --output json)

  SOURCE_CONFIG=$(echo "$CURRENT" | jq -c --arg img "$ECR_IMAGE" --arg role "$ROLE_ARN" '{
    ImageRepository: {
      ImageIdentifier: $img,
      ImageRepositoryType: .Service.SourceConfiguration.ImageRepository.ImageRepositoryType,
      ImageConfiguration: {
        Port: "3000",
        RuntimeEnvironmentVariables: {
          NEXT_PUBLIC_API_URL: "https://dev-api.wetruck.ai/api/v1"
        }
      }
    },
    AuthenticationConfiguration: { AccessRoleArn: $role }
  }')

  aws apprunner update-service \
    --service-arn "$SERVICE_ARN" \
    --source-configuration "$SOURCE_CONFIG" \
    --region "$AWS_REGION" \
    --output json | jq '{ OperationId, Service: { ServiceName: .Service.ServiceName, Status: .Service.Status } }'

  echo ""
  echo "Deployment initiated! Image: ${ECR_IMAGE}"
fi

echo ""
echo "Check status: aws apprunner describe-service --service-arn ${SERVICE_ARN:-<new-service-arn>} --region ${AWS_REGION}"
