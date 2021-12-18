class Port {
  constructor(id) {
    this.id = id;
    this.subscription = null;
    this.valueObservable$ = new Rx.Subject();
  }

  setValue(value) {
    this.valueObservable$.next(value);
  }

  sub(rhs) {
    // subscribe and store the subscription for unsubscribe
    this.subscription = rhs.valueObservable$.subscribe(
      this.next.bind(this),
      this.error.bind(this),
      this.complete.bind(this)
    );

    return this.subscription;
  }

  unsub() {
    if (this.subscription != null) {
      //console.log("%s unsubscribing!", this.id);
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  closeObservable() {
    if (this.valueObservable$) {
      this.valueObservable$.complete();
    }
  }

  /**
   * Part of the observable interface.
   *
   * @param {*} x
   */
  next(x) {
    //console.log("%s says: got value %d!", this.id, x);
    this.setValue(x);
  }

  /**
   * Part of the observable interface.
   *
   * @param {*} err
   */
  error(err) {
    console.error("%s says: something wrong occurred: %s", this.id, err);
  }

  /**
   * Part of the observable interface.
   *
   * REMEMBER: This method is only called when the observer is subscribed to the observable
   * at the time complete() is called on the observable! If the observer has unsubscribed
   * from the observable before complete() is called, this method is never called!
   */
  complete() {
    //console.log("%s says: complete", this.id);
    this.valueObservable$.complete();
    this.subscription.unsubscribe();
  }
}
