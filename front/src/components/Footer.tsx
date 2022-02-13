import React, {CSSProperties} from "react";

var style: CSSProperties = {
    backgroundColor: '#F8F8F8',
    borderTop: '1px solid #E7E7E7',
    textAlign: 'center',
    padding: '20px',
    position: 'fixed',
    left: '0',
    bottom: '0',
    height: '60px',
    width: '100%',
}

var phantom = {
    display: 'block',
    padding: '20px',
    height: '60px',
    width: '100%',
}

function Footer() {
    return (
        <div>
            <div style={phantom} />
            <div style={style}>
                Cheers to <a href={"https://tezos.org.ua/en"}>Tezos Ukraine</a> for organizing the <a href={"https://hackathon2022.tezos.org.ua/en"}>hackathon</a>.
            </div>
        </div>
    )
}

export default Footer;