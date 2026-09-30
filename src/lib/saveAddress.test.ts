import { describe, expect, it, vi } from 'vitest';
import { parseAddressValue } from './addressValue';
import { saveAddress } from './saveAddress';

describe('saveAddress', () => {
  it('persists a reset value to the active DatoCMS field path', async () => {
    const initialAddress = parseAddressValue(
      '{"country":"US","formatted_address":"Charlotte, NC, USA"}',
    );
    const setFieldValue = vi.fn().mockResolvedValue(undefined);

    await saveAddress(
      {
        fieldPath: 'address.en',
        setFieldValue,
      },
      initialAddress,
    );

    expect(setFieldValue).toHaveBeenCalledOnce();
    expect(setFieldValue).toHaveBeenCalledWith(
      'address.en',
      expect.stringContaining('"formatted_address": "Charlotte, NC, USA"'),
    );
  });
});
