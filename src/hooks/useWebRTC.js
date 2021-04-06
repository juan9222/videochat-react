import { useState, useEffect } from 'react'
import {createLocalPeerConnection} from '../services/webRTCServices'

export function useWebRTC({
    onEmitRegisterVideochatID,
    onEmitICECandidate,
    onEmitSDPOffer,
    onEmitSDPAnswer,
    localVideoRef,
    remoteVideoRef,
    localStream,
    remotePeer
 }) {

    const [localWebRTCPeer,setLocalWebRTCPeer] = useState(createLocalPeerConnection)
    useEffect(() => {
        // Ask the user to activate the camera and mic
       navigator.mediaDevices.getUserMedia({ audio: true, video: true })
       .then(audioVideoStream => {
           localVideoRef.current.srcObject = audioVideoStream;
           localStream.current = audioVideoStream;
           debugger
           onEmitRegisterVideochatID();
       }).catch(getUserMediaError => alert(getUserMediaError));

   }, []);

   function createWebRTCPeer (userID) {
    debugger
       localWebRTCPeer.onicecandidate = (onICECandidateEvent) => (onICECandidateEvent.candidate) ? 
       (onEmitICECandidate({ callee: remotePeer.current, candidate: onICECandidateEvent.candidate})):
        null;
       localWebRTCPeer.ontrack = (onTrackEvent) => remoteVideoRef.current.srcObject = onTrackEvent.streams[0];
       localWebRTCPeer.onnegotiationneeded = () => {
           localWebRTCPeer.createOffer({ offerToReceiveVideo: 1 , offerToReceiveAudio: 1 })
           .then(SDPOffer =>  localWebRTCPeer.setLocalDescription(SDPOffer))
           .then(() => {
               onEmitSDPOffer({
                  callee: userID,
                  sdp:  localWebRTCPeer.localDescription})
            })
           .catch(createOfferErrorEvent => alert(createOfferErrorEvent));
       };
       return localWebRTCPeer;
   }
   function onRemotePeerJoined(userID) {
    debugger
    setLocalWebRTCPeer(createWebRTCPeer(userID))
    localStream.current.getTracks().forEach(track => localWebRTCPeer.addTrack(track, localStream.current));
    remotePeer.current = userID;
   }
   function onSDPOffer(SDPOfferData) {
    debugger
        setLocalWebRTCPeer(createWebRTCPeer())
        localWebRTCPeer.setRemoteDescription(new RTCSessionDescription(SDPOfferData.sdp))
        .then(() => {
            localStream.current.getTracks().forEach(track => localWebRTCPeer.addTrack(track, localStream.current));
        })
        .then(() => {
            return localWebRTCPeer.createAnswer({ offerToReceiveVideo: 1 , offerToReceiveAudio: 1 });
        })
        .then(SDPAnswerData => {
            return localWebRTCPeer.setLocalDescription(SDPAnswerData);
        })
        .then(() => {
            onEmitSDPAnswer({
                callee: SDPOfferData.caller,
                sdp: localWebRTCPeer.localDescription
            });
        })
   }
   function onLocalPeerJoined (userID) {
    debugger
    remotePeer.current = userID
   }
   function stopTracks() {
    debugger
    localStream.current.getTracks().forEach((track) => track.stop());
   }
   function onSDPAnswer (SDPAnswerData) {
    debugger
    localWebRTCPeer.setRemoteDescription(new RTCSessionDescription(SDPAnswerData.sdp))
    .catch(SDPAnswerEvent => alert(SDPAnswerEvent))
   }
   function onICECandidate (ICECandidateData) {
    debugger
    localWebRTCPeer.addIceCandidate(new RTCIceCandidate(ICECandidateData))
    .catch(ICECandidateEvent => alert(ICECandidateEvent))
   }
   return {
    stopTracks,
    onRemotePeerJoined,
    onLocalPeerJoined,
    onSDPOffer,
    onSDPAnswer,
    onICECandidate
   }
}


