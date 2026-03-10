export type DndChannelStatus = 'active' | 'inactive'
export type GhlStatus = 'ok' | 'degraded'

export interface DndChannelSetting {
  status: DndChannelStatus
  message: string
  code: string
}

export interface InboundDndSetting {
  status: DndChannelStatus
  message: string
}

export interface ContactDndSettings {
  Call?: DndChannelSetting
  Email?: DndChannelSetting
  SMS?: DndChannelSetting
  WhatsApp?: DndChannelSetting
  GMB?: DndChannelSetting
  FB?: DndChannelSetting
}

export interface ContactInboundDndSettings {
  all?: InboundDndSetting
}

export interface CustomFieldFileMeta {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  uuid: string
}

export interface CustomFieldFileValueEntry {
  meta: CustomFieldFileMeta
  url: string
  documentId: string
}

export type CustomFieldFileValue = Record<string, CustomFieldFileValueEntry>

export type CustomFieldValue =
  | string
  | number
  | string[]
  | CustomFieldFileValue

export interface ContactCustomField {
  id: string
  key: string
  field_value: CustomFieldValue
}

export interface CreateHighLevelContactRequest {
  firstName: string
  lastName?: string
  name?: string
  email?: string
  locationId: string
  gender?: string
  phone?: string
  address1?: string
  city?: string
  state?: string
  postalCode?: string
  website?: string
  timezone?: string
  dnd?: boolean
  dndSettings?: ContactDndSettings
  inboundDndSettings?: ContactInboundDndSettings
  tags?: string[]
  customFields?: ContactCustomField[]
  source?: string
  dateOfBirth?: string
  country?: string
  companyName?: string
  assignedTo?: string
}

export interface GhlContact {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  locationId?: string
  tags?: string[]
}

export interface CreateHighLevelContactResponse {
  contact?: GhlContact
  id?: string
  success?: boolean
  message?: string
}

