import { connect } from 'datocms-plugin-sdk';
import 'datocms-react-ui/styles.css';
import AddressInput from './entrypoints/AddressInput';
import ConfigScreen from './entrypoints/ConfigScreen';
import FieldConfig from './entrypoints/FieldConfig';
import { render } from './utils/render';

const ADDRESS_EXTENSION_ID = 'address';
type FieldExtensionId = typeof ADDRESS_EXTENSION_ID;

function parseFieldExtensionId(value: string): FieldExtensionId {
  if (value === ADDRESS_EXTENSION_ID) {
    return value;
  }

  throw new Error(`Unknown field extension: ${value}`);
}

function assertNever(value: never): never {
  throw new Error(`Unhandled field extension: ${String(value)}`);
}

connect({
  renderConfigScreen(ctx) {
    render(<ConfigScreen ctx={ctx} />);
  },

  manualFieldExtensions() {
    return [
      {
        id: ADDRESS_EXTENSION_ID,
        name: 'Google Places address',
        type: 'editor',
        fieldTypes: ['json'],
        configurable: true,
      },
    ];
  },

  renderManualFieldExtensionConfigScreen(fieldExtensionId, ctx) {
    const extensionId = parseFieldExtensionId(fieldExtensionId);

    switch (extensionId) {
      case ADDRESS_EXTENSION_ID:
        render(<FieldConfig ctx={ctx} />);
        return;
      default:
        assertNever(extensionId);
    }
  },

  renderFieldExtension(fieldExtensionId, ctx) {
    const extensionId = parseFieldExtensionId(fieldExtensionId);

    switch (extensionId) {
      case ADDRESS_EXTENSION_ID:
        render(<AddressInput ctx={ctx} />);
        return;
      default:
        assertNever(extensionId);
    }
  },
});
