export interface MapDataRequest {
  endpoint: string;
  token: string;
}

export interface MapDataResponse {
  status: 'ok';
  features: Array<Record<string, unknown>>;
}

export const fetchMapData = async (request: MapDataRequest): Promise<MapDataResponse> => {
  const simulatedFeature = {
    endpoint: request.endpoint,
    authorized: Boolean(request.token),
  };

  return Promise.resolve({
    status: 'ok',
    features: [simulatedFeature],
  });
};
