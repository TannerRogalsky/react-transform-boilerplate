import Timer from './Timer';

let tasks = {};
let taskID = 0;

const update = function() {
    const dt = this.timer.getDelta();
    const mt = this.timer.getTime();

    this.callback(dt, mt);

    // if this is false, the callback has stopped the task
    if (tasks[this.id]) {
        this.timer.step();
        this.timer.nextFrame(this.update);
    }
};

const Runner = {};

Runner.run = function(callback) {
    const timer = new Timer();
    const id = taskID++;
    const task = {
        id: id,
        timer: timer,
        callback: callback
    };
    task.update = update.bind(task);
    tasks[id] = task;

    timer.step();

    timer.nextFrame(task.update);
    return id;
};

Runner.pause = function(id) {
    const task = tasks[id];
    if (task) {
        task.timer.cancelFrame();
    }
}

Runner.resume = function(id) {
    const task = tasks[id];
    if (task) {
        task.timer.nextFrame(task.update);
    }
}

Runner.stop = function(id) {
    const task = tasks[id];
    if (task) {
        task.timer.cancelFrame();
        delete tasks[id];
    }
}

Runner.stopAll = function() {
    for (const id in tasks) {
        tasks[id].timer.cancelFrame();
    }
    tasks = {};
}

export default Runner;
