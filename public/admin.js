
var account = document.getElementById('account').value;
  
function paid(sheet, code, e) {
  fetch('/payment', { 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({account: account, sheet: sheet, code: code, paid: e.checked })
  })
  .then(function(response) {
    if(response.ok) {
      console.log('Line is updated');
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
}

function remark(sheet, code, e) {
  fetch('/remark', { 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({account: account, sheet: sheet, code: code, remark: e.value })
  })
  .then(function(response) {
    if(response.ok) {
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
}