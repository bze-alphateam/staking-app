import {ExtendedValidator as Validator} from './staking';

type ImageSource = {
  imageSource: 'cosmostation' | 'keybase';
};

export const splitIntoChunks = (arr: any[], chunkSize: number) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

export const getKeybaseUrl = (identity: string) => {
  return `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`;
};

export const addLogoUrlSource = async (
  validator: Validator,
): Promise<Validator & ImageSource> => {

  return { ...validator, imageSource: 'keybase' };
};

export const getLogoUrls = async (
  validators: Validator[],
  chainName: string
) => {
  const validatorsWithImgSource = await Promise.all(
    validators.map((validator) => addLogoUrlSource(validator))
  );

  // keybase urls
  const keybaseIdentities = validatorsWithImgSource
    .filter((validator) => validator.imageSource === 'keybase')
    .map(({ address, identity }) => ({
      address,
      identity,
    }));

  const chunkedIdentities = splitIntoChunks(keybaseIdentities, 20);

  let responses: any[] = [];

  for (const chunk of chunkedIdentities) {
    const logoUrlRequests = chunk.map(({ address, identity }) => {
      if (!identity) return { address, url: '/logo_320px.png' };

      return fetch(getKeybaseUrl(identity))
        .then((response) => response.json())
        .then((res) => ({
          address,
          url: res.them?.[0]?.pictures?.primary.url || '/logo_320px.png',
        }));
    });
    responses = [...responses, await Promise.all(logoUrlRequests)];
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const keybaseUrls = responses.flat();

  return [...keybaseUrls].reduce(
      (prev, cur) => ({...prev, [cur.address]: cur.url}),
      {}
  );
};
