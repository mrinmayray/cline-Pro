import * as grpc from '@grpc/grpc-js';
import { launchBrowser, closeBrowser, performBrowserAction } from '../browser';

export class BrowserServiceImpl {
  static addToServer(server: grpc.Server) {
    server.addService({
      launchBrowser: async (call: any, callback: any) => {
        try {
          const { url } = call.request;
          const result = await launchBrowser(url);
          callback(null, result);
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      closeBrowser: async (call: any, callback: any) => {
        try {
          const success = await closeBrowser();
          callback(null, { success });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      performBrowserAction: async (call: any, callback: any) => {
        try {
          const { action, params } = call.request;
          const result = await performBrowserAction(action, params);
          callback(null, result);
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      }
    }, 'cline.BrowserService');
  }
}