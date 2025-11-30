import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ChangeHandler } from "@/lib/events/input";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

export interface OllamaConfig {
  domain: string;
  port: number;
}

async function getOllamaConfig() {

  return await invoke<OllamaConfig>('get_ollama_config')
}

async function setOllamaConfig(config: OllamaConfig) {
  await invoke<OllamaConfig>('set_ollama_config', { config })
}

export function OllamaConfig() {
  const [config, setConfig] = useState<OllamaConfig>({ domain: 'http://localhost', port: 11434 })

  useEffect(() => {
    getOllamaConfig().then(config => {
      setConfig(config)
    })
  }, [])

  const updateConfig = useCallback(async (config: OllamaConfig) => {
    // Update on backend
    await setOllamaConfig(config)

    // Then update the local state
    setConfig(config)
  }, [])

  return (
    <Fragment>
      <h3 class="text-2xl font-bold">Ollama Configuration</h3>
      <br />
      <form>
        <FieldSet>
          <FieldGroup>
            <Field className="max-w-lg">
              <FieldLabel htmlFor="name">Hostname or IP</FieldLabel>
              <Input 
                tabIndex={0}
                id="name"
                autoComplete="off"
                placeholder="http://localhost"
                defaultValue={config?.domain}
                onChange={ChangeHandler((value) => {
                  updateConfig({ ...config, domain: value })
                })}
              />
              <FieldDescription>The hostname or ip of the server hosting Ollama.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Port</FieldLabel>
              <Input 
                className="max-w-[15ch]"
                tabIndex={0}
                id="name"
                autoComplete="off"
                placeholder="11434"
                defaultValue={config?.port}
                type="number"
                min="1"
                max="65535"
                step="10"
                onChange={ChangeHandler((value) => {
                  updateConfig({ ...config, port: Number.parseInt(value) })
                })}
              />
              <FieldDescription>The hostname or ip of the server hosting Ollama.</FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>

    </Fragment>
  )
};