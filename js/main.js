const liftInput = document.querySelector("#lifts");
const floorInput = document.querySelector("#floors");

const simulateInp = document.querySelector(".Submit");
const reloadInp = document.querySelector(".reload");
const simulatedUIDiv = document.querySelector(".simulatedUI");

const floorToLiftsMap = new Map();
const liftToFloorMap = new Map();
let liftArr = [];
const busyLifts = new Set();
const notBusyLifts = new Set();

const liftYPos = [];
const liftDir = [];

function init() {
  const lifts = Number(liftInput.value);
  const floors = Number(floorInput.value);
  console.log(
    `Initializing environment for lifts: ${lifts} and floors: ${floors}...`
  );

  renderUI(lifts, floors);
  liftInput.disabled = true;
  floorInput.disabled = true;
  simulateInp.disabled = true;
  reloadInp.disabled = false;

  for (let i = 1; i <= lifts; i++) {
    notBusyLifts.add(i);
    liftArr.push(i);
    liftYPos.push(0);
    liftDir.push("");
    liftToFloorMap.set(i, 1); // initially every lift is present on 1st floor
  }

  floorToLiftsMap.set(1, liftArr);
  for (let i = 2; i <= floors; i++) {
    floorToLiftsMap.set(i, []); // storing every floor's initial lift information
  }
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

      const downSpan = document.createElement("span");
      const downBtn = document.createElement("button");
      downBtn.textContent = "D";
      downBtn.addEventListener("click", () => {
        move(i, "down");
      });
      downSpan.appendChild(downBtn);

      if (i == 1) {
        controlDiv.appendChild(upSpan);
      } else if (i == floors) {
        controlDiv.appendChild(downSpan);
      } else {
        controlDiv.appendChild(upSpan);
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
    }
  }
}

simulateInp.addEventListener("click", init);
reloadInp.addEventListener("click", reloadPage);

function reloadPage() {
  liftInput.value = 0;
  liftInput.disabled = false;
  floorInput.value = 0;
  floorInput.disabled = false;
  simulateInp.disabled = false;
  reloadInp.disabled = true;
  while (simulatedUIDiv.firstChild) {
    simulatedUIDiv.removeChild(simulatedUIDiv.firstChild);
  }
}

//after reaching target floor, user wants to go in which direction (up,down)
function move(target, direction) {
  let up = Number(target),
    down = Number(target);
  const floors = Number(floorInput.value);

  // If all lifts are busy, wait for 2.5 sec for event to start again
  if (busyLifts.size === Number(liftInput.value)) {
    setTimeout(move, 2500, target, direction);
  }

  if (
    floorToLiftsMap.get(target).length == 0 ||
    isLiftDirectionDiff(direction, floorToLiftsMap.get(target)) === 0
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

function isLiftDirectionDiff(direction, liftList) {
  let ans = 0;
  for (let i = 0; i <= liftList.length; i++) {
    if (direction == liftDir[liftList[i] - 1]) {
      ans = 1;
      break;
    }
  }
  return ans;
}

function moveLiftHelper(source, direction, target) {
  let toBeUsedLift = floorToLiftsMap.get(source)[0];
  busyLifts.add(toBeUsedLift);
  liftDir[toBeUsedLift - 1] = direction;
  console.log(toBeUsedLift + " lift is available on floor" + source);
  floorToLiftsMap.get(source).splice(0, 1);
  startAnimation(toBeUsedLift, target, target - source);
}

function startAnimation(liftId, target, diff) {
  const lift = document.getElementById(`lift${liftId}`);
  console.log("current y:" + liftYPos[liftId - 1]);
  liftYPos[liftId - 1] = liftYPos[liftId - 1] - diff * 146;
  const keyframesLocal = new KeyframeEffect(
    lift,
    [{ transform: `translateY(${liftYPos[liftId - 1]}%)` }],
    {
      duration: 2000,
      fill: "both",
    }
  );

  const liftAnimation = new Animation(keyframesLocal, document.timeline);
  liftAnimation.play();
  liftAnimation.onfinish = () => {
    console.log("new y:" + liftYPos[liftId - 1]);
    busyLifts.delete(liftId);
    floorToLiftsMap.get(target).push(liftId);
    console.log("Animation ended..");
  };
}
