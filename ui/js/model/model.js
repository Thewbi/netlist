let port1 = new Port("port1");
let port2 = new Port("port2");

let wire1 = new Wire("wire1");
let wire2 = new Wire("wire2");

function modelTest() {
  console.log("modelTest()");

  console.log(port1);
  console.log(port2);

  console.log(wire1);
  console.log(wire2);

  //let subscription = wire1.valueObservable$.subscribe(x => console.log('Observable changed to: %d', x));

  // let subscription = wire1.valueObservable$.subscribe(
  //   port1.next,
  //   port1.error,
  //   port1.complete
  // );

  let subscription = port1.sub(wire1);
  wire2.sub(port1);
  port2.sub(wire2);

  wire1.setValue(1);
  wire1.setValue(0);
  wire1.setValue(1);

  //subscription.unsubscribe();
  //port1.unsub();

  wire1.setValue(4);
  wire1.setValue(5);
  wire1.setValue(6);

  //wire1.valueObservable$.complete();
  wire1.closeObservable();
}

modelTest();
