declare module "@salesforce/apex/CMS_ContentTypesCT.getAllManagedContentTypesCT" {
  export default function getAllManagedContentTypesCT(): Promise<any>;
}
declare module "@salesforce/apex/CMS_ContentTypesCT.getManagedContentTypeCT" {
  export default function getManagedContentTypeCT(param: {typeId: any}): Promise<any>;
}
declare module "@salesforce/apex/CMS_ContentTypesCT.createManagedContentTypeCT" {
  export default function createManagedContentTypeCT(param: {mct: any}): Promise<any>;
}
declare module "@salesforce/apex/CMS_ContentTypesCT.deleteManagedContentTypeCT" {
  export default function deleteManagedContentTypeCT(param: {typeId: any}): Promise<any>;
}
