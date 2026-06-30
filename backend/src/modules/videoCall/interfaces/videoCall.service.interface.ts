export interface IVideoCallService {
    createRoom(
        appointmentId: string,
        doctorId: string,
        patientId: string,
    ): Promise<{ roomName: string; appointmentID: string }>
    getToken(roomName: string, identity: string): Promise<string>
    endRoom(roomName: string): Promise<void>
    completeRoom(roomName: string): Promise<void>
    getRoomByAppointment(appointmentId: string): Promise<{ roomName: string }>
}
