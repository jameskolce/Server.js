import * as http from "http"
import { f } from '@jameskolce/lambda.js'

interface Response {
  status?: number
  headers?: any
  payload?: any
  encoding?: string
}

// ·············································································
// Main server function

export function server (serverDefinition: any) {
  return http.createServer(async (
    httpRequest: http.IncomingMessage,
    httpResponse: http.ServerResponse
  ) => {
    const request = await f.pipeAsync(serverDefinition.requestPipe || [])({ httpRequest, server: serverDefinition })
    const response = serializeResponse(await f.pipeAsync(serverDefinition.responsePipe || [])(request))
  
    // Send response to the client
    httpResponse.writeHead(response.status, response.headers)
    httpResponse.end(response.payload)
  }).listen(
    serverDefinition.port || 3000,
    () => console.log(`Server listening on port ${serverDefinition.port || 3000}`)
  )
}

function serializeResponse (response: Response): Response {
  const serializedPayload = response.headers['Content-Type'] === 'application/json'
    ? JSON.stringify(response.payload)
    : response.payload

  return {
    status: response.status,
    headers: {
      'Content-Length': Buffer.byteLength(serializedPayload, response.encoding || 'utf-8'),
      ...response.headers || {}
    },
    payload: serializedPayload
  }
}
