import React from "react";
import {Button} from "react-bootstrap";
import {disconnectFromBeacon} from "../../services/BeaconService";
import {raceActions} from "../../store/race";
import {useDispatch} from "react-redux";

const DisconnectButton = (): JSX.Element => {
  const dispatch = useDispatch();

  const disconnectWallet = async (): Promise<void> => {
    disconnectFromBeacon().then(() => dispatch(raceActions.setConnetedWallet(null))).catch(error => console.log(error));
  }

  return (
      <Button variant={"outline-info"} onClick={disconnectWallet}>
        Disconnect
      </Button>
  );
};

export default DisconnectButton;
