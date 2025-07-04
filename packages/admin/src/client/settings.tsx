/* eslint-disable no-alert */
import React from 'react'
import {useLocalStorage} from 'react-use'
import {z} from 'zod'
import {createCascadingState} from './utils/cascading-state'
import {ZForm} from './utils/zform/form'

export const Settings = z.object({
  apiUrl: z.string().optional(),
  includeSchemas: z.string().optional(),
  excludeSchemas: z.string().optional(),
  headers: z.record(z.string()).optional(),
  migrations: z.object({
    skipDestructiveActionWarning: z.boolean().optional(),
  }),
})

export type Settings = z.infer<typeof Settings>

export const settingsContext = createCascadingState<Settings>(
  JSON.parse(localStorage.getItem('settings.0.0.2') || '{}') as never, // todo: figure out why trpc isn't getting the update
  defaultValue => useLocalStorage('settings.0.0.2', defaultValue),
)

export const useSettings = () => {
  const [value, update] = settingsContext.useState()

  return {...value, update}
}

export const SettingsPanel = () => {
  const {update, ...value} = useSettings()

  return (
    <div className="h-full overflow-auto">
      <h1>Settings</h1>
      <ZForm
        useFormProps={{defaultValues: value, mode: 'onSubmit'}}
        className="gap-5"
        schema={Settings}
        submitButton="Save"
        onSubmit={values => {
          update(values)
          window.location.reload()
        }}
      />
    </div>
  )
}
