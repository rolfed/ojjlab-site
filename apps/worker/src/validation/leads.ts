import z from "zod";
import { parsePhoneNumber } from "libphonenumber-js/min";
import isEmail from 'validator/es/lib/isEmail';

export const LeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string()
});

export function validatePhone(phone?: string): string | undefined {
  if (!phone) {
    return undefined;
  }

  const normalized = phone.trim();
  const parsed = parsePhoneNumber(phone, 'US');

  if (!parsed || !parsed.isValid) {
    throw new Error('Invalid phone number')
  }

  return parsed.number;
}

export function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase()

  if (!isEmail(normalized)) {
    throw new Error('Invalid email address')
  }

  return normalized
}
