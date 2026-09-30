import { useState } from 'react';
import type { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Button, Canvas, FieldGroup, Form, TextField } from 'datocms-react-ui';
import { normalizePluginParameters } from '../lib/parameters';
import styles from './shared.module.css';

type ConfigScreenProps = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: ConfigScreenProps) {
  const currentParameters = normalizePluginParameters(
    ctx.plugin.attributes.parameters,
  );
  const [apiKey, setApiKey] = useState(currentParameters.mapsAPIKey);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const normalizedApiKey = apiKey.trim();

    if (!normalizedApiKey) {
      ctx.alert('Enter a Google Maps API key before saving.');
      return;
    }

    setSaving(true);

    try {
      await ctx.updatePluginParameters({
        ...ctx.plugin.attributes.parameters,
        mapsAPIKey: normalizedApiKey,
      });
      ctx.notice('Google Maps API key saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Canvas ctx={ctx}>
      <Form>
        <FieldGroup>
          <TextField
            id="maps-api-key"
            name="maps-api-key"
            label="Google Maps API key"
            hint="Use a browser key restricted to DatoCMS and your local development origin."
            value={apiKey}
            onChange={setApiKey}
            required
            textInputProps={{
              autoComplete: 'off',
              type: 'password',
            }}
          />
        </FieldGroup>
        <div className={styles.actions}>
          <Button
            type="button"
            buttonType="primary"
            disabled={saving || !apiKey.trim()}
            onClick={() => void handleSubmit()}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </Form>
    </Canvas>
  );
}
