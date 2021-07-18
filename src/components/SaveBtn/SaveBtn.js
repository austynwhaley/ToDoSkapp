import React from 'react'
import "./style.css"

function SaveBtn(props) {
    return (

        <div>
            <button type="button" onClick = {props.onClick} className="save btn btn-dark btn-sm">{props.name}</button>
        </div>
        
    )
}

export default SaveBtn
