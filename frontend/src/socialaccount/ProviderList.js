import { useConfig } from '../auth'
import { redirectToProvider, Client, settings } from '../lib/allauth'
import Button from '../components/Button'

export default function ProviderList (props) {
  const config = useConfig()
  const providers = config.data.socialaccount.providers
  if (!providers.length) {
    return null
  }
  return (
    <>
      {settings.client === Client.BROWSER && <ul>
        {providers.map(provider => {
          return (
            <li key={provider.id}>
              <Button onClick={() => redirectToProvider(provider.id, props.callbackURL, props.process)}>{provider.name}</Button>
            </li>
          )
        })}
      </ul>}
    </>
  )
}
