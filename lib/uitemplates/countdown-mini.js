// name: countdown-mini
<!DOCTYPE html>
<div id="{{'countdown-'+$id}}"></div>
<script>
(function(scope) {
  try {
    let wholeTime = 3600;
    let timeLeft = 0;
    let endTime;
    let lastHours, lastMins;
    let isPaused = false;
    let isStopped = true;

    function countdown(elementName, interval) {
      let element, msLeft, time, hours, mins;
      function twoDigits(n) {
        return n <= 9 ? '0' + n : n;
      }

      function updateTimer() {
        msLeft = endTime - (+new Date());
        if (msLeft < 1000 || isStopped) {
          let refTime; 
          if (timeLeft > 5) {
              refTime = timeLeft;
          } else {
              refTime = wholeTime;
          }
          const leftMins = Math.floor(refTime / 60);
          const leftSecs = Math.round(refTime - (leftMins * 60));
          element.innerHTML =  `${twoDigits(leftMins)}:${twoDigits(leftSecs)}`;
          //    element.innerHTML = "00:00";
          //  element.innerHTML = "countdown's over!";
        } else if (isPaused) {
          time = new Date( msLeft );
          hours = lastHours;
          mins = lastMins;
          console.log('pause countdown', isPaused, hours, mins);
          element.innerHTML =
            (hours ? hours + ':' + twoDigits(mins) : mins) +
            ':' +
            twoDigits(time.getUTCSeconds());
          //  setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        } else {
          time = new Date(msLeft);
          hours = lastHours = time.getUTCHours();
          mins = lastMins = time.getUTCMinutes();
          element.innerHTML =
            (hours ? hours + ':' + twoDigits(mins) : mins) +
            ':' +
            twoDigits(time.getUTCSeconds());
          setTimeout(updateTimer, time.getUTCMilliseconds() + 500);
        }
      }

      element = document.getElementById(elementName);
      endTime = calcEndTime(interval);
      if (element) {
        updateTimer();
      }
    }

    function calcEndTime(seconds) {
      const leftMins = Math.floor(seconds / 60);
      const leftSecs = Math.round(seconds - (leftMins * 60));
      const end = +new Date() + 1000 * (60 * leftMins + leftSecs) + 500;
      //    console.log('calcEndTime', leftMins, leftSecs, end);
      return end;
    };

    function startCron() {
        isStopped = false;
        isPaused = false;
        console.log('started countdown', wholeTime);
        timeLeft = wholeTime;
        scope.send({
          event: 'started',
          wholeTime,
          resources: {'5850': true},
        });              
        countdown(`countdown-${scope.$id}`, wholeTime);
    };
    
    function restartCron() {
        isPaused = false;
        isStopped = false;
        console.log('restarted countdown', timeLeft);
        scope.send({
          event: 'restarted',
          timeLeft,
          resources: {'5850': true},
        });
        countdown(`countdown-${scope.$id}`, timeLeft);
    };
    
    function pauseCron() {
        isPaused = true;
        isStopped = false;
        console.log('paused countdown', timeLeft);
        scope.send({
          event: 'paused',
          timeLeft,
          resources: {'5850': false},
        });
    };
    
    function stopCron() {
        isStopped = true;
        isPaused = false;
        timeLeft = 0;
        console.log('stopped countdown', timeLeft);
        countdown(`countdown-${scope.$id}`, wholeTime);
        scope.send({
          event: 'stopped',
          wholeTime,
          resources: {'5850': false},
        });   
    };
    
    function ticked() {
        endTime = calcEndTime(timeLeft);
        //  console.log('ticked countdown 5538', timeLeft, endTime);
        scope.send({
          event: 'ticked',
          timeLeft,
          resources: {'5538': timeLeft},
        });
    };
    
    scope.$watch('msg', msg => {
      if (msg) {
        if (msg.topic) {
          if (msg.topic.search('5523') !== -1) {   
            switch(msg.payload) {
                case "started": 
                    startCron();
                    break;
                case "restarted": 
                    restartCron();
                    break;
                case "paused": 
                    pauseCron();
                    break;
                case "stopped": 
                    stopCron();
                    break;
                case "ticked": 
                    ticked();
                    break;
            }
          } 
          if (msg.topic.search('5850') !== -1) {
            if (msg.payload === true) {
              if (isStopped) {
                if (timeLeft && timeLeft > 5) {
                    restartCron();
                } else {
                    startCron();
                }
              } else if (isPaused) {
                restartCron();
              } 
            } else if (msg.payload === false) {
              if (!isStopped) {
                //stopCron();
              } else if (isPaused) {
              } 
              if (!timeLeft || timeLeft < 5) {
                //  stopCron();
              } else if (timeLeft > 5) {
                pauseCron();
              }
            }
          } else if (msg.topic.search('5521') !== -1) {
            console.log('5521 : ', msg.payload);
            wholeTime = msg.payload;
            //  endTime = calcEndTime(wholeTime);
            console.log('update countdown 5521', wholeTime);
            scope.send({
              event: 'updated',
              wholeTime,
              resources: {'5521': wholeTime},
            });
            //if (msg.topic.search('0/3340') !== -1 && !timeLeft) {
            //    countdown(`countdown-${scope.$id}`, wholeTime);
            //}
          } else if (msg.topic.search('5538') !== -1) {
             if (msg.payload !== timeLeft && msg.payload !== null) {
                if (msg.payload < 0) msg.payload = 0;
                if (msg.payload) {
                    //  displayTimeLeft(value);
                    countdown(`countdown-${scope.$id}`, msg.payload);
                    if (!isStarted) {
                        restartCron();
                    }
                    //  setTimeString(value);
                } else if (isStarted) {
                    stopCron();
                }
            }
            timeLeft = msg.payload;
            console.log('update countdown 5538', timeLeft);
            if (msg.topic.search('0/3340') !== -1 && timeLeft > 3) {
            //     countdown(`countdown-${scope.$id}`, timeLeft);
            }
          }
        }
      }
    });
  } catch (error) {
    return null;
  }
})(scope);
</script>
