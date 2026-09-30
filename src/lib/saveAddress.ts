import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import type { AddressValue } from '../types';
import { serializeAddressValue } from './addressValue';

type FieldValueWriter = Pick<
  RenderFieldExtensionCtx,
  'fieldPath' | 'setFieldValue'
>;

export function saveAddress(
  ctx: FieldValueWriter,
  address: AddressValue,
): Promise<void> {
  return ctx.setFieldValue(ctx.fieldPath, serializeAddressValue(address));
}
