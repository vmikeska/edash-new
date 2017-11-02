
import { Injectable, ComponentFactoryResolver, ReflectiveInjector, Type, ViewContainerRef, ComponentRef, ComponentFactory } from '@angular/core';

@Injectable()
export class DynamicCreationService {

    constructor(private _componentFactoryResolver: ComponentFactoryResolver) {

    }

    public createInstance<T>(t: Type<T>, target: ViewContainerRef): ComponentRef<T> {

        let factory = this._componentFactoryResolver.resolveComponentFactory(t);

        // vCref is needed cause of that injector..
        let injector = ReflectiveInjector.fromResolvedProviders([], target.parentInjector);

        // create component without adding it directly to the DOM
        let comp = factory.create(injector);

        var inst = <T>comp.instance;

        //add inputs first !! otherwise component/template crashes ..
        // inst["data"] = "this is a test";

        // all inputs set? add it to the DOM ..
        target.insert(comp.hostView);

        return comp;
    }

    public createInst<T>(t: Type<T>, target: ViewContainerRef, initModel: (model: T) => void): ComponentRef<T> {

        let factory = this._componentFactoryResolver.resolveComponentFactory(t);

        // vCref is needed cause of that injector..
        let injector = ReflectiveInjector.fromResolvedProviders([], target.parentInjector);

        // create component without adding it directly to the DOM
        let comp = factory.create(injector);

        var inst = <T>comp.instance;

        //add inputs first !! otherwise component/template crashes ..        
        if (initModel) {
            initModel(inst);
        }

        // all inputs set? add it to the DOM ..
        target.insert(comp.hostView);

        return comp;
    }

   
}