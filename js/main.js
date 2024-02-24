const liftInput = document.querySelector("#lifts");
const floorInput = document.querySelector("#floors");

const simulateInp = document.querySelector(".Submit");
//const clearInp = document.querySelector(".clear");
const simulatedUIDiv = document.querySelector(".simulatedUI");

let floorToLiftsMap;
let liftToFloorMap;
let liftArr;
let busyLifts;
let notBusyLifts;
let liftYPos;
let liftDir;
let pendingEventSet;
let processingEventSet;
let completedEvents;
let timerId;

function init() {
  const lifts = Number(liftInput.value);
  const floors = Number(floorInput.value);

  if (validateInput(lifts, floors) == false) {
    console.log("Invalid lifts/floors Input");
    return;
  }

  console.log(
    `Initializing environment for lifts: ${lifts} and floors: ${floors}...`
  );

  renderUI(lifts, floors);
  disableForm();

  floorToLiftsMap = new Map();
  liftToFloorMap = new Map();
  liftArr = [];
  busyLifts = new Set();
  notBusyLifts = new Set();
  liftYPos = [];
  liftDir = [];
  pendingEventSet = new Set();
  processingEventSet = new Set();
  completedEvents = [];

  for (let i = 1; i <= lifts; i++) {
    notBusyLifts.add(i);
    liftArr.push(i);
    liftYPos.push(0);
    liftDir.push("up");
    liftToFloorMap.set(i, 1); // initially every lift is present on 1st floor
  }

  floorToLiftsMap.set(1, liftArr);
  for (let i = 2; i <= floors; i++) {
    floorToLiftsMap.set(i, []); // storing every floor's initial lift information
  }
}

function timeoutFunction() {
  //every 1 sec, run pending event
  if (pendingEventSet.size != 0) {
    for (const x of pendingEventSet) {
      let keyVal = x.split("+");
      move2(Number(keyVal[0]), keyVal[1]);
      break;
    }
  }
}

function validateInput(lifts, floors) {
  let ans = true;
  let errorText = "";
  if (!Number.isInteger(floors) || isNaN(floors) || floors < 2) {
    errorText += "Floors can only be a positive integer greater than 2.\n";
    ans = false;
  }
  if (!Number.isInteger(lifts) || isNaN(lifts) || lifts < 1) {
    errorText += "Lifts can only be a positive integer greater than 1.";
    ans = false;
  }
  if (ans == false) {
    alert(errorText);
  }
  return ans;
}

function renderUI(lifts, floors) {
  for (let i = +floors; i >= 1; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.className = "floor";
    floorDiv.id = `floor${i}`;
    console.log(floorDiv.id);
    simulatedUIDiv.appendChild(floorDiv);
  }

  if (floors != 1) {
    for (let i = floors; i >= 1; i--) {
      const floorDiv = document.querySelector(`#floor${i}`);
      const controlDiv = document.createElement("div");
      controlDiv.className = "control";
      controlDiv.id = `control${i}`;

      const upSpan = document.createElement("span");
      const upBtn = document.createElement("button");
      upBtn.textContent = "U";
      upBtn.addEventListener("click", () => {
        move(i, "up");
      });
      upSpan.appendChild(upBtn);

      const floorName = document.createElement("span");
      floorName.textContent = i - 1;

      const downSpan = document.createElement("span");
      const downBtn = document.createElement("button");
      downBtn.textContent = "D";
      downBtn.addEventListener("click", () => {
        move(i, "down");
      });
      downSpan.appendChild(downBtn);

      if (i == 1) {
        controlDiv.appendChild(upSpan);
        controlDiv.appendChild(floorName);
      } else if (i == floors) {
        controlDiv.appendChild(downSpan);
        controlDiv.appendChild(floorName);
      } else {
        controlDiv.appendChild(upSpan);
        controlDiv.appendChild(floorName);
        controlDiv.appendChild(downSpan);
      }
      console.log(floorDiv.id);
      floorDiv.appendChild(controlDiv);
    }

    for (let i = 1; i <= lifts; i++) {
      const firstFloor = document.querySelector("#floor1");
      const liftDiv = document.createElement("div");
      liftDiv.className = "lift";
      liftDiv.id = `lift${i}`;
      firstFloor.appendChild(liftDiv);
      const leftDoor = document.createElement("div");
      //leftDoor.className = "door";
      leftDoor.className = "door ldoor";
      leftDoor.id = `leftDoor${i}`;
      liftDiv.appendChild(leftDoor);
      const rightDoor = document.createElement("div");
      //rightDoor.className = "door";
      rightDoor.className = "door rdoor";
      rightDoor.id = `rightDoor${i}`;
      liftDiv.appendChild(rightDoor);
    }
  }
}

function disableForm() {
  liftInput.disabled = true;
  liftInput.className = floorInput.className = "";
  floorInput.disabled = true;
  simulateInp.disabled = true;
  simulateInp.className = "Submit";
  //clearInp.disabled = false;
  //clearInp.className = "clear enabledButton";
}

/*function clearPage() {
  liftInput.value = 1;
  liftInput.disabled = false;
  floorInput.value = 2;
  floorInput.disabled = false;
  liftInput.className = floorInput.className = "enabledInput";
  simulateInp.disabled = false;
  simulateInp.className = "Submit enabledButton";
  clearInp.disabled = true;
  clearInp.className = "clear";
  while (simulatedUIDiv.firstChild) {
    simulatedUIDiv.removeChild(simulatedUIDiv.firstChild);
  }
}*/

simulateInp.addEventListener("click", init);
//clearInp.addEventListener("click", clearPage);

//after reaching target floor, user wants to go in which direction (up,down)
function move(target, direction) {
  let eventString = `${target}+${direction}`;
  if (
    !pendingEventSet.has(eventString) &&
    !processingEventSet.has(eventString)
  ) {
    pendingEventSet.add(eventString);
    move2(target, direction);
    console.log(pendingEventSet);
  }
}

function move2(target, direction) {
  console.log("move to " + target + " in direction " + direction);
  let up = Number(target),
    down = Number(target);
  const floors = Number(floorInput.value);
  let eventString = `${target}+${direction}`;

  // If all lifts are busy, wait for 2.5 sec for event to start again
  if (busyLifts.size === Number(liftInput.value)) {
    console.log(
      "lifts are busy:: wait for pending events to process again." + eventString
    );
    return;
  }

  console.log(`Deleting in pending ${eventString}`);
  console.log(`Adding in processing ${eventString}`);
  pendingEventSet.delete(eventString);
  processingEventSet.add(eventString);

  const lifts = Number(liftInput.value);
  if (lifts == 1 && floorToLiftsMap.get(target).length == 1) {
    if (!busyLifts.has(1)) openDoors(1, target, true, direction);
    else {
      console.log(`Adding in pending ${eventString}`);
      console.log(`Deleting in processing ${eventString}`);
      pendingEventSet.add(eventString);
      processingEventSet.delete(eventString);
    }
    return;
  }

  if (
    floorToLiftsMap.get(target).length == 0 ||
    isLiftDirectionDiff(target, direction, floorToLiftsMap.get(target)) === 0
  ) {
    while (up <= floors || down >= 1) {
      up++;
      down--;
      if (floorToLiftsMap.has(up) && floorToLiftsMap.get(up).length != 0) {
        moveLiftHelper(up, direction, target);
        break;
      }
      if (floorToLiftsMap.has(down) && floorToLiftsMap.get(down).length != 0) {
        moveLiftHelper(down, direction, target);
        break;
      }
    }
  }
}

function isLiftDirectionDiff(target, direction, liftList) {
  let ans = 0;
  for (let i = 0; i < liftList.length; i++) {
    if (direction == liftDir[liftList[i] - 1]) {
      ans = 1;
      //a lift is present on same floor
      if (!busyLifts.has(liftList[i]))
        openDoors(liftList[i], target, true, direction);
      else {
        console.log(`Adding in pending ${eventString}`);
        console.log(`Deleting in processing ${eventString}`);
        pendingEventSet.add(eventString);
        processingEventSet.delete(eventString);
      }
      break;
    }
  }
  return ans;
}

function moveLiftHelper(source, direction, target) {
  let eventString = `${target}+${direction}`;
  console.log("in move lift helper:" + eventString);
  let i = 0;
  let toBeUsedLift = 0;
  for (i = 0; i < floorToLiftsMap.get(source).length; i++) {
    if (!busyLifts.has(floorToLiftsMap.get(source)[i])) {
      toBeUsedLift = floorToLiftsMap.get(source)[i];
      floorToLiftsMap.get(source).splice(i, 1);
      busyLifts.add(toBeUsedLift);
      liftDir[toBeUsedLift - 1] = direction;
      console.log(toBeUsedLift + " lift is available on floor" + source);
      startAnimation(toBeUsedLift, target, target - source, direction);
      break;
    }
  }
  if (toBeUsedLift == 0) {
    console.log(`Adding in pending ${eventString}`);
    console.log(`Deleting in processing ${eventString}`);
    pendingEventSet.add(eventString);
    processingEventSet.delete(eventString);
  }
}

function startAnimation(liftId, target, diff, direction) {
  let eventString = `${target}+${direction}`;
  console.log("in start animation:" + eventString);
  const lift = document.getElementById(`lift${liftId}`);
  let current = liftYPos[liftId - 1];
  console.log("current y:" + liftYPos[liftId - 1]);
  liftYPos[liftId - 1] = liftYPos[liftId - 1] - diff * 103;
  const keyframesLocal = new KeyframeEffect(
    lift,
    [
      { transform: `translateY(${current}px)` },
      { transform: `translateY(${liftYPos[liftId - 1]}px)` },
    ],
    {
      duration: 2000 * Math.abs(diff),
      fill: "both",
    }
  );

  const liftAnimation = new Animation(keyframesLocal, document.timeline);
  liftAnimation.onfinish = () => {
    console.log("new y:" + liftYPos[liftId - 1]);
    //busyLifts.delete(liftId);
    //floorToLiftsMap.get(target).push(liftId);
    console.log("Lift has reached..");
    openDoors(liftId, target, false, direction);
  };
  liftAnimation.play();
}

function openDoors(liftId, target, onSameFloor, direction) {
  let eventString = `${target}+${direction}`;
  console.log("Doors Opening.." + eventString);
  /*console.log("target: " + target);
  if (onSameFloor) {
    busyLifts.add(liftId);
  }*/
  const leftDoor = document.getElementById(`leftDoor${liftId}`);
  const rightDoor = document.getElementById(`rightDoor${liftId}`);
  const ldoorOpenKeyFrame = new KeyframeEffect(
    leftDoor,
    [{ transform: `translateX(-100%) scaleX(0)` }],
    {
      duration: 2500,
      easing: "linear",
      direction: "alternate",
      iterations: 2,
    }
  );

  const rdoorOpenKeyFrame = new KeyframeEffect(
    rightDoor,
    [{ transform: `translateX(100%) scaleX(0)` }],
    {
      duration: 2500,
      easing: "linear",
      direction: "alternate",
      iterations: 2,
    }
  );

  const ldoorAnimation = new Animation(ldoorOpenKeyFrame, document.timeline);
  const rdoorAnimation = new Animation(rdoorOpenKeyFrame, document.timeline);
  if (!busyLifts.has(liftId)) {
    busyLifts.add(liftId);
  }

  ldoorAnimation.onfinish = () => {
    busyLifts.delete(liftId);
    console.log(processingEventSet);
    console.log(`deleting in processing ${eventString}`);
    console.log(`adding in completed ${eventString}`);

    processingEventSet.delete(eventString);
    completedEvents.push(eventString);
    console.log(completedEvents);
    if (!onSameFloor) {
      floorToLiftsMap.get(target).push(liftId);
    }
  };

  ldoorAnimation.play();
  rdoorAnimation.play();
}

setInterval(timeoutFunction, 1000);
