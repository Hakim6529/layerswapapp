import Layout from '../components/layout'
import { FormWizardProvider } from '../context/formWizardProvider'
import { AuthStep } from '../Models/Wizard'
import AuthWizard from '../components/Wizard/AuthWizard'
import { InferGetServerSidePropsType } from 'next'
import LayerSwapAuthApiClient from '../lib/userAuthApiClient'
import { useEffect, useState } from 'react'
import inIframe from '../components/utils/inIframe'
import { SwapDataProvider } from '../context/swap'
import LayerSwapApiClient from '../lib/layerSwapApiClient'
import { LayerSwapAppSettings } from '../Models/LayerSwapAppSettings'

export default function AuthPage({ settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  LayerSwapAuthApiClient.identityBaseEndpoint = settings.discovery.identity_url
  let appSettings = new LayerSwapAppSettings(settings)
  
  const [embedded, setEmbedded] = useState<boolean>()

  useEffect(() => {
    setEmbedded(inIframe())
  }, [])

  return (
    <Layout settings={appSettings}>
      <SwapDataProvider>
        <FormWizardProvider initialStep={AuthStep.Email} initialLoading={false}>
          <AuthWizard />
        </FormWizardProvider >
      </SwapDataProvider>
    </Layout>
  )
}

export async function getServerSideProps(context) {

  context.res.setHeader(
    'Cache-Control',
    's-maxage=60, stale-while-revalidate'
  );

  var apiClient = new LayerSwapApiClient();
  const { data: settings } = await apiClient.GetSettingsAsync()

  const resource_storage_url = settings.discovery.resource_storage_url
  if (resource_storage_url[resource_storage_url.length - 1] === "/")
    settings.discovery.resource_storage_url = resource_storage_url.slice(0, -1)

  LayerSwapAuthApiClient.identityBaseEndpoint = settings.discovery.identity_url

  return {
    props: { settings }
  }
}