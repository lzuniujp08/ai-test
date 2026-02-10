export const fetchMapData = async (request) => {
  const simulatedFeature = {
    endpoint: request.endpoint,
    authorized: Boolean(request.token),
  };

  return Promise.resolve({
    status: 'ok',
    features: [simulatedFeature],
  });
};
