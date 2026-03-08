type STATUS = 'success' | 'failure'; 

const GHL_ENDPOINT = 'https://links.goldenleadsolutions.com/widget/form/f48eANaPNMCRSx2XP3Y7'

export async function submitFreeTrial(formData: FormData, endpoint = GHL_ENDPOINT): Promise<void>  {
  const freeTrialFormKey ='f48eANaPNMCRSx2XP3Y7';
  const ENDPOINT = `${endpoint}/${freeTrialFormKey}`;

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    });

    window.location.href = '/book-trial/';

  } catch (err) {
    console.error('[FreeTrial] submission failed: ', err);
  }
}
