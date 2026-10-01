import { useEffect, useMemo, useState } from 'react';
import type { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, FieldGroup, Form, SelectField } from 'datocms-react-ui';
import {
  toFieldOption,
  type FieldOption,
} from '../lib/fieldOptions';
import { languages } from '../lib/languages';
import { normalizeFieldParameters } from '../lib/parameters';
import type { LanguageOption } from '../types';

type FieldConfigProps = {
  ctx: RenderManualFieldExtensionConfigScreenCtx;
};

const menuPortalTarget =
  typeof document === 'undefined' ? null : document.body;

const SELECT_MENU_PROPS = {
  isSearchable: true,
  menuPlacement: 'bottom' as const,
  menuPosition: 'fixed' as const,
  menuPortalTarget,
  maxMenuHeight: 220,
  styles: {
    menuPortal: (base: Record<string, unknown>) => ({
      ...base,
      zIndex: 10_000,
    }),
  },
};

function isSingleOption<T extends { label: string; value: string }>(
  option: T | readonly T[] | null,
): option is T {
  return option !== null && !Array.isArray(option);
}

export default function FieldConfig({ ctx }: FieldConfigProps) {
  const initialParameters = normalizeFieldParameters(ctx.parameters);
  const [language, setLanguage] = useState(initialParameters.language);
  const [searchSeedField, setSearchSeedField] = useState<FieldOption | null>(
    initialParameters.searchSeedField,
  );
  const [seedFieldOptions, setSeedFieldOptions] = useState<FieldOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSeedFields() {
      try {
        const fields = await ctx.loadItemTypeFields(ctx.itemType.id);

        if (cancelled) {
          return;
        }

        const currentApiKey = ctx.pendingField.attributes.api_key;
        const options = fields
          .flatMap((field) => {
            const option = toFieldOption(field);
            return option && option.value !== currentApiKey ? [option] : [];
          })
          .sort((left, right) => left.label.localeCompare(right.label));

        setSeedFieldOptions(options);
      } catch {
        if (!cancelled) {
          setSeedFieldOptions([]);
        }
      }
    }

    void loadSeedFields();

    return () => {
      cancelled = true;
    };
  }, [ctx]);

  const selectedSeedOption = useMemo(() => {
    if (!searchSeedField) {
      return null;
    }

    return (
      seedFieldOptions.find((option) => option.value === searchSeedField.value) ??
      searchSeedField
    );
  }, [searchSeedField, seedFieldOptions]);

  function persistParameters(
    nextLanguage: LanguageOption,
    nextSeedField: FieldOption | null,
  ) {
    void ctx.setParameters({
      ...ctx.parameters,
      language: nextLanguage,
      searchSeedField: nextSeedField,
    });
  }

  function handleLanguageChange(
    option: LanguageOption | readonly LanguageOption[] | null,
  ) {
    if (!isSingleOption(option)) {
      return;
    }

    setLanguage(option);
    persistParameters(option, searchSeedField);
  }

  function handleSeedFieldChange(
    option: FieldOption | readonly FieldOption[] | null,
  ) {
    if (option !== null && !isSingleOption(option)) {
      return;
    }

    setSearchSeedField(option);
    persistParameters(language, option);
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
              ...SELECT_MENU_PROPS,
              isClearable: false,
              options: languages,
            }}
            required
          />
          <SelectField
            id="search-seed-field"
            name="searchSeedField"
            label="Prefill search from"
            hint="When the address is empty, seed the Places lookup with this field’s value so editors can search from the entry name or title."
            value={selectedSeedOption}
            onChange={handleSeedFieldChange}
            selectInputProps={{
              ...SELECT_MENU_PROPS,
              isClearable: true,
              placeholder: 'None',
              options: seedFieldOptions,
              noOptionsMessage: () => 'No string or text fields on this model',
            }}
          />
        </FieldGroup>
      </Form>
    </Canvas>
  );
}
