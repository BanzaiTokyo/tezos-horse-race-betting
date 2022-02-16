import {Alert, Badge, Card, OverlayTrigger, Tooltip} from "react-bootstrap";
import React, {useState} from "react";

const AboutPage = (props: any) => {
    const [show, setShow] = useState(true);


    return (<div>
            {show && <Card>
                <Card.Body>
                    <Alert variant="light" dismissible={props.closeable} onClose={() => setShow(false)}>
                        <Alert.Heading>Welcome!</Alert.Heading>
                        <p>
                            This project was developed by BanzaiTokyo team for the Horse Betting challenge by Ubinetics.
                            This
                            challenge is a part of <a href="https://hackathon2022.tezos.org.ua/en">The Tezos DeFi
                            Hackathon
                            2022</a> organized by <a href={"https://tezos.org.ua/en"}>Tezos Ukraine</a>
                        </p>
                        <Alert variant="info">
                            It is not a production grade project. It is running in a test network. It is deployed for
                            the
                            evaluation purposes only and will be taken down shortly.
                        </Alert>
                        <p>
                            The <a
                            href={"https://github.com/BanzaiTokyo/tezos-ukraine-hackathon-ubinetic"}>repository</a> is
                            temporarily public. There you can find readme with the technical documentation.
                        </p>

                        <Alert.Heading>Functional description</Alert.Heading>
                        <p>There are 6 horses that are randomly selected for the race from the stable. You can place
                            bets on
                            any horse using your uUSD tokens. The first bet will start the race.</p>

                        <p>Once the race starts you will see the positions in which the horses are running in this lap.
                            The
                            lap will last as long as the bets are coming. If there are no bets for certain period of
                            time
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="button-tooltip-2">
                                    2 epochs to be precise
                                </Tooltip>}
                                defaultShow={false} delay={1000}>
                                <Badge pill bg="info">i</Badge>
                            </OverlayTrigger>
                            &nbsp;
                            the lap will end. If you've placed your bet on the horse running first you may win the whole
                            race! But there is a twist - at the end of the race two things will happen: 1. we will
                            decide if
                            it was the last lap in the game. If it was
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="button-tooltip-2">
                                    the probability of that happening is less than a half
                                </Tooltip>}
                                defaultShow={false} delay={1000}>
                                <Badge pill bg="info">i</Badge>
                            </OverlayTrigger>
                            &nbsp;
                            - lucky you, you've won! congratulations! But if
                            there is going to be another lap, we will need to calculate the positions of the horses in
                            the
                            next lap and the twist is that the horse with most bets
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="button-tooltip-2">
                                    in fact the probability each horse winning the lap will be inversely proportional to
                                    the
                                    amount of tokens placed on it.
                                </Tooltip>}
                                defaultShow={false} delay={1000}>
                                <Badge pill bg="info">i</Badge>
                            </OverlayTrigger>
                            &nbsp;
                            will have the smallest chance of being the first. So you choose whether to bet on the
                            favorite
                            or on the underdog.
                        </p>
                        <p>
                            Even though no one knows in advance when the race will end
                            <OverlayTrigger
                                placement="bottom"
                                overlay={<Tooltip id="button-tooltip-2">
                                    We make extra sure that it will end by increasing the probability of it ending with
                                    each
                                    lap.
                                </Tooltip>}
                                defaultShow={false} delay={1000}>
                                <Badge pill bg="info">i</Badge>
                            </OverlayTrigger>
                            , all good things must come to an end. The tokens placed on all losing horses are collected
                            into
                            a pool that is separated between the players that bet on the winning horse proportionately
                            the
                            their share in the bets on the winning horse. In the case where no one has placed a bet on
                            the
                            winning horse, the pool is transferred to the next race. A jackpot - good for the next
                            players!
                        </p>


                    </Alert>
                </Card.Body>
            </Card>}
        </div>
    );
}

export default AboutPage;
