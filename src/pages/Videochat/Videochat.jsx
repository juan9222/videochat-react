import React, {useRef} from 'react'
import { useParams, useHistory } from "react-router-dom";
import { useWebRTC } from  '../../hooks/useWebRTC'
import { useSocket } from '../../hooks/useSocket'
import './Videochat.css';
import logo from '../../logo.svg';
import hangup from '../../hangup.png';


export default function Videochat() {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const localStream = useRef();
    const remotePeer = useRef();
    const { id } = useParams();
    const history = useHistory();
    const {
        stopTracks,
        onRemotePeerJoined,
        onLocalPeerJoined,
        onSDPOffer,
        onSDPAnswer,
        onICECandidate
       } = useWebRTC( {
        onEmitRegisterVideochatID,
        onEmitICECandidate,
        onEmitSDPOffer,
        onEmitSDPAnswer,
        localVideoRef,
        remoteVideoRef,
        localStream,
        remotePeer
     });
    const {socket, onSendMessage} = useSocket({
        remotePeerJoined : onRemotePeerJoined,
        localPeerJoined : onLocalPeerJoined,
        SDPOffer: onSDPOffer,
        SDPAnswer: onSDPAnswer,
        ICECandidate: onICECandidate
    });
    
    function onEmitRegisterVideochatID () {
        onSendMessage("registerVideochatID", id);
    }
    function onEmitICECandidate (ICECandidates) {
        onSendMessage("ICECandidate", ICECandidates);
    } 
    function onEmitSDPOffer (SDPOfferData) {
        onSendMessage("SDPOffer", {
            ...SDPOfferData,
            caller: socket.id,
        });

    } 
    function onEmitSDPAnswer (SDPAnswerData) {
        onSendMessage("SDPAnswer", {
            ...SDPAnswerData,
            caller: socket.id,
        });
    } 
    const handleHangUp = () => {
        stopTracks();
        history.push('/');
    }
    return (
        <div className="Videochat">
            <nav className="Videochat__Navbar">
                <img src={logo} className="Videochat__Logo" alt="logo" />
                <h1 className="Videochat__NavabarTitle">Videochat</h1>
            </nav>
            <video autoPlay playsInline muted ref={remoteVideoRef} className="Videochat__MainVideo"/>
            <video autoPlay playsInline muted ref={localVideoRef} className="Videochat__MinorVideo"/>
            <nav className="Videochat__Footbar">
                <div className="Videochat__HangUpButton">
                    <img src={hangup} onClick={handleHangUp} className="Videochat__FootbarHangUp" alt="Hang Up"/> 
                </div>
            </nav>
        </div>
    )
}


