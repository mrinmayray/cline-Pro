import * as grpc from '@grpc/grpc-js';
import Store from 'electron-store';

const store = new Store();

export class McpServiceImpl {
  static addToServer(server: grpc.Server) {
    server.addService({
      getMcpServers: (call: any, callback: any) => {
        try {
          const servers = store.get('mcpServers') || [];
          callback(null, { servers });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      },
      
      toggleMcpServer: (call: any, callback: any) => {
        try {
          const { name, enabled } = call.request;
          const servers = store.get('mcpServers') || [];
          
          const updatedServers = servers.map((server: any) => 
            server.name === name ? { ...server, disabled: !enabled } : server
          );
          
          store.set('mcpServers', updatedServers);
          callback(null, { servers: updatedServers });
        } catch (error: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message
          });
        }
      }
    }, 'cline.McpService');
  }
}