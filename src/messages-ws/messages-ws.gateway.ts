import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}


  async handleConnection(client: Socket, ...args: any[]) {
    
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload

    try {
      payload = this.jwtService.verify( token )
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;      
    }
    
    this.updateClientsList();
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient( client.id );
    this.updateClientsList();    
  }

  updateClientsList() {
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){
    //message-from-server

    //Emite al cliente que envia
    //client.emit('message-from-server', {
    //  fullName: 'Nombre del usuario',
    //  message: payload.message || 'no-message!!'
    //})

    //Todos menos el usuario que envia
    //client.broadcast.emit('message-from-server', {
    //  fullName: 'Nombre del usuario',
    //  message: payload.message || 'no-message!!'
    //})

    //Todos los usuarios
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || 'no-message!!'
    })
  }

}
