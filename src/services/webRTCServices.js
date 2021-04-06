const TURNSTUNConfiguration = {
    iceServers: [
        {
            urls: "stun:stun2.l.google.com:19302",
        },
        {
            urls: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        },
    ]
}

export function createLocalPeerConnection () {
    return new RTCPeerConnection(TURNSTUNConfiguration)
}