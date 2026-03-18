import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';

@WebSocketGateway({ cors: { origin: '*' } })
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly conversationsService: ConversationsService) {}

  handleConnection(client: Socket) {
    // Basic connection handler, you could parse auth here and join rooms if needed
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle joining a conversation room
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; senderId: string; content: string },
  ) {
    try {
      // Use the service to save to DB and emit broadly 
      const message = await this.conversationsService.sendMessageAndEmit(
        payload.conversationId,
        payload.senderId,
        payload.content,
        this.server,
      );
      return { success: true, message };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }
}
