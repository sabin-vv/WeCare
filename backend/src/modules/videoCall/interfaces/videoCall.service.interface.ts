export interface IVideoCallService {
    createRoom(appointmentId: string, doctorId: string, patientId: string): Promise<{ roomName: string }>
    getToken(roomName: string, identity: string): Promise<string>
    endRoom(roomName: string): Promise<void>
}
