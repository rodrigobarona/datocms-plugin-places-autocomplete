import { useState } from 'react';
import type { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, FieldGroup, Form, SelectField } from 'datocms-react-ui';
import { languages } from '../lib/languages';
import { normalizeFieldParameters } from '../lib/parameters';
import type { LanguageOption } from '../types';

type FieldConfigProps = {
  ctx: RenderManualFieldExtensionConfigScreenCtx;
};

export default function FieldConfig({ ctx }: FieldConfigProps) {
  const initialParameters = normalizeFieldParameters(ctx.parameters);
  const [language, setLanguage] = useState(initialParameters.language);

  function handleLanguageChange(
    option: LanguageOption | readonly LanguageOption[] | null,
  ) {
    if (!option || Array.isArray(option)) {
      return;
    }

    const selectedLanguage = option as LanguageOption;
    setLanguage(selectedLanguage);
    ctx.setParameters({
      ...ctx.parameters,
      language: selectedLanguage,
    });
  }

  return (
    <Canvas ctx={ctx}>
      <Form>
        <FieldGroup>
          <SelectField
            id="language"
            name="language"
            label="Results language"
            hint="Google will prefer autocomplete results in this language."
            value={language}
            onChange={handleLanguageChange}
            selectInputProps={{
              isClearable: false,
              isSearchable: true,
              menuPlacement: 'auto',
              options: languages,
            }}
            required
          />
        </FieldGroup>
      </Form>
    </Canvas>
  );
}
