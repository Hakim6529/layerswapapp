import LayerSwapApiClient from '../../lib/layerSwapApiClient';
import Layout from '../../components/layout';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { SwapDataProvider } from '../../context/swap';
import LayerSwapAuthApiClient from '../../lib/userAuthApiClient';
import { TimerProvider } from '../../context/timerContext';
import { LayerSwapAppSettings } from '../../Models/LayerSwapAppSettings';
import { getThemeData } from '../../helpers/settingsHelper';
import dynamic from 'next/dynamic';

const SwapWithdrawal = (dynamic(() => import('../../components/SwapWithdrawal'), {
  loading: () => <div className={`bg-secondary-900 md:shadow-card rounded-lg w-full sm:overflow-hidden relative`}>
    <div className='text-center text-xl text-secondary-100'>
    </div>
    <div className="relative px-6">
      <div className="flex items-start">
        <div className={`flex flex-nowrap grow`}>
          <div className="w-full pb-6 flex flex-col justify-between space-y-5 text-secondary-text h-full">
            <div className="sm:min-h-[504px]"></div>
          </div>
        </div>
      </div>
    </div>
    <div id="widget_root" />
  </div>
}))

const SwapDetails = ({ settings, themeData }: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  let appSettings = new LayerSwapAppSettings(settings)
  LayerSwapAuthApiClient.identityBaseEndpoint = appSettings.discovery.identity_url

  return (<>
    <Layout settings={appSettings} themeData={themeData}>
      <SwapDataProvider >
        <TimerProvider>
          <SwapWithdrawal />
        </TimerProvider>
      </SwapDataProvider >
    </Layout>
  </>)
}

export const getServerSideProps = async (ctx) => {
  const params = ctx.params;
  let isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.swapId);
  if (!isValidGuid) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  var apiClient = new LayerSwapApiClient();
  const { data } = await apiClient.GetSettingsAsync()
  const settings = data
  let themeData = await getThemeData(ctx.query)
  return {
    props: {
      settings,
      themeData
    }
  }
}

export default SwapDetails