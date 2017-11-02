import { AppWin } from "../components/base-window.component";


export class WinResizing {
  public static isResizing = false;
  public static currentWin: AppWin;

  public static horizontal = false;
  public static horizontalDir: ResizeDirection;

  public static vertical = false;
  public static verticalDir: ResizeDirection;

  public static winLeft: number;
  public static winTop: number;
  public static winWidth: number;
  public static winHeight: number;

}

export enum ResizeDirection { leftHalf, rightHalf }