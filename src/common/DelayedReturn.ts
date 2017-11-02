
export class DelayedReturn {

	constructor(delay = 1000) {
		this.delay = delay;
	}

	public callback: Function;

	public delay = 1000;

	private timeoutId = null;

	public cancel() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	public execute() {
		this.callback();
		this.cancel();
	}

	public call() {
		this.cancel();

		this.timeoutId = setTimeout(() => {
			this.timeoutId = null;
			this.callback();
		},
		this.delay);
	}

}