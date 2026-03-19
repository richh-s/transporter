import commonEn from "./en/common.json";
import authEn from "./en/auth.json";
import validationEn from "./en/validation.json";
import dashboardEn from "./en/dashboard.json";
import shipmentsEn from "./en/shipments.json";
import fleetEn from "./en/fleet.json";
import driversEn from "./en/drivers.json";
import organizationEn from "./en/organization.json";
import profileEn from "./en/profile.json";
import gpsEn from "./en/gps.json";
import priceQuotesEn from "./en/price_quotes.json";
import podEn from "./en/pod.json";
import commonAm from "./am/common.json";
import authAm from "./am/auth.json";
import validationAm from "./am/validation.json";
import dashboardAm from "./am/dashboard.json";
import shipmentsAm from "./am/shipments.json";
import fleetAm from "./am/fleet.json";
import driversAm from "./am/drivers.json";
import organizationAm from "./am/organization.json";
import profileAm from "./am/profile.json";
import gpsAm from "./am/gps.json";
import priceQuotesAm from "./am/price_quotes.json";
import podAm from "./am/pod.json";

export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    validation: validationEn,
    dashboard: dashboardEn,
    shipments: shipmentsEn,
    fleet: fleetEn,
    drivers: driversEn,
    organization: organizationEn,
    profile: profileEn,
    gps: gpsEn,
    price_quotes: priceQuotesEn,
    pod: podEn,
  },
  am: {
    common: commonAm,
    auth: authAm,
    validation: validationAm,
    dashboard: dashboardAm,
    shipments: shipmentsAm,
    fleet: fleetAm,
    drivers: driversAm,
    organization: organizationAm,
    profile: profileAm,
    gps: gpsAm,
    price_quotes: priceQuotesAm,
    pod: podAm,
  },
} as const;
