import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SuperBalls } from '@uiball/loaders';
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

const AdminArea = (props) => {
    const _axios                      = props.props.axios;
    const user                        = props.props.user;
    const [loaded, setLoaded]         = useState(false);
    const [err, setErr]               = useState("");
    const [errMsg, setErrMsg]         = useState("");
    const [lifeGroups, setLifeGroups] = useState({});

    if (!loaded) {
        _axios.get('http://localhost:3001/adminArea', {
            withCredentials: true
        }).then((result) => {
            if (result.error) {
                setErr(true);
                setErrMsg(result.msg);
                setLoaded(true);
            } else {
                console.log(result.data.life_groups);
                setLifeGroups(result.data.life_groups);
                setLoaded(true);
            }
        });
    }

    const convertTime = (timeString) => {
        return new Date('1970-01-01T' + timeString + 'Z').toLocaleTimeString('en-US',{timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'});
    }

    const updateDisplay = (groupID, checked) => {
        _axios.post('http://localhost:3001/updateDisplay',{
            groupID:groupID,
            checked:checked,
        }, {
            withCredentials: true
        }).then((result) => {
            if (result.error) {
                setErr(true);
                setErrMsg(result.msg);
            }
        });
    }

    return (
        <>
        {
            !loaded &&
            <div className='mt-5 d-flex justify-content-center'>
                <SuperBalls 
                    size={100}
                    speed={1.4} 
                    color="black" 
                />
            </div>
        }
        {
            !user &&
            <Navigate to='/'/>
        }
        {
            loaded && lifeGroups &&
            <table className='table table-success table-striped'>
                <tbody>
                    {lifeGroups.map((e, i) => {
                        return (
                            <tr data-group-makeup={e.group_makeup} data-age-range={e.age_range} data-child-care={e.child_care} key={e.ID}>
                                <td className='col-md-6 col-xs-12'>
                                    {e.name}<br/>
                                    <span className='fs-6 fw-lighter'>{e.co_leader_name ? `Leader: ${e.leader_name} Co-leader: ${e.co_leader_name}` : `Leader: ${e.leader_name}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{e.meeting_interval === 'Weekly' ? `${e.day_meet}'s @${convertTime(e.time_meet)}` : `${e.meeting_interval}: ${e.day_meet} @${convertTime(e.time_meet)}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`Location: ${e.location}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`Group Type: ${e.group_type}`}</span><br/>
                                </td>
                                <td className='col-md-6 col-xs-12 align-middle'>
                                    <div className='d-flex justify-content-end'>
                                        <BootstrapSwitchButton
                                            checked={e.display === 1 ? true : false}
                                            onlabel='Show'
                                            offlabel='Hide'
                                            onChange={(checked) => {
                                                updateDisplay(e.ID, checked)
                                            }}
                                            size="lg"
                                            onstyle='success'
                                            offstyle='danger'
                                            style="d-flex justify-content-end"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        }
        </>
    )
};

export default AdminArea;