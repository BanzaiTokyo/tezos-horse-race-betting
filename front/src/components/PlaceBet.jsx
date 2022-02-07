import React from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";

const PlaceBet = () => {

    return (<div>
            <Form>
                <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                    <Form.Group as={Col} md="4" controlId="validationFormikUsername2">

                        <InputGroup hasValidation sm={3}>
                            <InputGroup.Text>uUSD</InputGroup.Text>
                            <Form.Control type="text" required isInvalid/>
                            <Form.Control.Feedback type="invalid">
                                Incorrect amount.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Col >
                        <Form.Select aria-label="Default select example">
                            <option>Open this select menu</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </Col>
                    <Col sm={2}>
                        <div className="d-grid">
                            <Button variant="info" type="submit">
                                Bet
                            </Button>
                        </div>
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );

}

export default PlaceBet;