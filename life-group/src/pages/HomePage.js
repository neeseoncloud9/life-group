import React, { useState } from 'react';
import { SuperBalls } from '@uiball/loaders';

const HomePage = (props) => {
    const _axios                      = props.props.axios;
    const [err, setErr]               = useState("");
    const [errMsg, setErrMsg]         = useState("");
    const [loaded, setLoaded]         = useState(false);
    const [lifeGroups, setLifeGroups] = useState(false);
    const [msg, setMsg]               = useState("");

    if (!loaded) {
        _axios.get('http://localhost:3001/', {
            withCredentials: true
        }).then((result) => {
            console.log(result.data.msg);
            if (result.data.error) {
                setErr(true);
                setErrMsg(result.data.msg);
                setLoaded(true);
            } else if (result.data.msg === `Sorry, Currently We Don't Have Any Life Groups Available`) {
                setMsg(result.data.msg);
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
            err &&
            <h3 className="text-center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        {
            loaded && lifeGroups &&
            <table className='table table-success table-striped'>
                <tbody>
                    {lifeGroups.map((e, i) => {
                        return (
                            <tr
                                data-group-makeup={e.group_makeup}
                                data-age-range={e.age_range}
                                data-child-care={e.child_care}
                                data-meeting-interval={e.meeting_interval}
                                data-group-type={e.group_type}
                                data-day-meet={e.day_meet}
                                key={e.ID}
                            >
                                <td className='col-md-6 col-xs-12'>
                                    {e.name}<br/>
                                    <span className='fs-6 fw-lighter'>{e.co_leader_name ? `Leader: ${e.leader_name} Co-leader: ${e.co_leader_name}` : `Leader: ${e.leader_name}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{e.meeting_interval === 'Weekly' ? `${e.day_meet}'s @${convertTime(e.time_meet)}` : `${e.meeting_interval}: ${e.day_meet} @${convertTime(e.time_meet)}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`Location: ${e.location}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`Group Type: ${e.group_type}`}</span><br/>
                                    <span className='fs-6 fw-lighter'>{`What A Typical Setting Looks Like: ${e.description}`}</span><br/>
                                </td>
                                <td className='col-md-6 col-xs-12 align-middle'>
                                    <button className="login-submit" onClick={() => {window.location.href = `/joinGroup?group=${Buffer.from(String(e.ID)).toString('base64')}`}}>Join Group</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        }
        {
            loaded && !lifeGroups &&
            <>
            <h4 className="text-center" style={{marginTop:'8rem'}} dangerouslySetInnerHTML={{__html: msg}}></h4>
            </>
        }
        </>
    )
};

export default HomePage;