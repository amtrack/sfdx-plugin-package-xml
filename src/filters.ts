import { FileProperties } from 'jsforce';

// https://help.salesforce.com/s/articleView?id=sf.packaging_component_attributes.htm&type=5
// Metadata Types which don't have an entry in the "SUBSCRIBER AND DEVELOPER EDITABLE" column
const MANAGED_READONLY_TYPES = [
  'ApexClass',
  'SharingReason',
  'ApexTrigger',
  'CustomLabel',
  'CustomPermission',
  // Custom Setting?
  // Email Template (Lightning)? -> EmailTemplate with fullName ending with underscore and a 13 digit number
  'HomePageComponent',
  'LightningComponentBundle',
  'AuraDefinitionBundle',
  'FlexiPage',
  'PermissionSet',
  'StaticResource',
  // Translation?
  'ApexComponent',
  'ApexPage'
];

// https://developer.salesforce.com/docs/atlas.en-us.234.0.packagingGuide.meta/packagingGuide/packaging_component_attributes.htm
// Metadata Types which have "All attributes" (and with some exceptions) in the "Subscriber and Developer Editable" column
const SUBSCRIBER_MOSTLY_EDITABLE_TYPES = [
  'CustomApplication',
  'CompactLayout',
  'Dashboard',
  'Document',
  'EmailTemplate',
  'DocumentFolder',
  'EmailFolder',
  'ReportFolder',
  'HomePageLayout',
  'Letterhead',
  'ListView',
  'NamedCredential',
  'Layout',
  'RemoteSiteSetting',
  'Report',
  'AnalyticSnapshot',
  'FieldSet', // Selected fields (only subscriber controlled)
  // 'QuickAction' // Action layout, Predefined values for action fields
];

const STANDARD_USERNAMES = ['Automated Process', 'salesforce.com'];

export function isManaged(fileProperties: FileProperties): boolean {
  return fileProperties.manageableState === 'installed';
}

export function isManagedReadOnly(fileProperties: FileProperties): boolean {
  return (
    MANAGED_READONLY_TYPES.includes(fileProperties.type) &&
    isManaged(fileProperties)
  );
}

export function isManagedWriteable(fileProperties: FileProperties): boolean {
  return (
    !MANAGED_READONLY_TYPES.includes(fileProperties.type) &&
    isManaged(fileProperties)
  );
}

export function isManagedMostlySubscriberEditable(
  fileProperties: FileProperties
): boolean {
  return (
    SUBSCRIBER_MOSTLY_EDITABLE_TYPES.includes(fileProperties.type) &&
    isManaged(fileProperties)
  );
}

export function isUnlocked(fileProperties: FileProperties): boolean {
  return fileProperties.manageableState === 'installedEditable';
}

export function isUnmanaged(fileProperties: FileProperties): boolean {
  return (
    fileProperties.manageableState === 'unmanaged' ||
    fileProperties.manageableState === undefined
  );
}

export function isUnlockedDeprecated(fileProperties: FileProperties): boolean {
  return fileProperties.manageableState === 'deprecatedEditable';
}

export function isManagedDeprecated(fileProperties: FileProperties): boolean {
  return fileProperties.manageableState === 'deprecated';
}

export function isDeprecated(fileProperties: FileProperties): boolean {
  return (
    isUnlockedDeprecated(fileProperties) || isManagedDeprecated(fileProperties)
  );
}

export function isStandard(fileProperties: FileProperties): boolean {
  return (
    (!fileProperties.namespacePrefix &&
      !fileProperties.manageableState &&
      !fileProperties.id) ||
    (STANDARD_USERNAMES.includes(fileProperties.createdByName) &&
      STANDARD_USERNAMES.includes(fileProperties.lastModifiedByName)) ||
    fileProperties.namespacePrefix === 'standard'
  );
}
