import axios from 'axios';

function sendingResponse (response) {
  return {
    type: 'SENDING_RESPONSE',
    response
  }
};

function sentResponse (matchStatus) {
  return {
    type: 'SENT_RESPONSE',
    matchStatus
  }
};

function sendResponseError (postError) {
  return {
    type: 'SEND_RESPONSE_ERROR',
    postError
  }
}

export function sendResponse (response, users_a_id, users_b_id) {
  return (dispatch, getState) => {    
    let status = '';
    let reason = '';
    response.meetSwitchIsOn ? status = 'accept' : status = 'reject';
    response.professionalSwitchIsOn ? reason = 'professional' : null;
    response.educationSwitchIsOn ? reason = 'education' : null;
    response.projectSwitchIsOn ? reason = 'project' : null;
    response.personalSwitchIsOn ? reason = 'personal' : null;

    dispatch( sendingResponse(response) );

    axios.post('http://localhost:3000/insert-connection', {
      users_a_id: users_a_id,
      users_b_id: users_b_id,
      status: status,
      reason: reason
    })
    .then( result => {
      var users_a_id = result.data.users_a_id;
      var users_b_id = result.data.users_b_id;
      var users_a_res = result.data.status;
      
      //check only if status is accept    
      if (users_a_res === 'accept') {
        axios.get('http://localhost:3000/check-match', {params: {
          users_a_id: users_a_id,
          users_b_id: users_b_id,
          status: 'accept'
        }})
        .then( result => {
          if (result.data.length === 1) {
            dispatch( sentResponse('MATCH') );
          } else {
            dispatch( sentResponse('NO_MATCH') );
          }
        })          
      }
      dispatch( sentResponse('NO_MATCH') );
    })
    .catch( error => {
      dispatch( sendResponseError('error') );
    })
  }
}