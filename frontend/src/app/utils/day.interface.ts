import { Menu } from "./menu.inteface"

export interface Day {
    dayInfo: Date       // FECHA COMPLETA DEL DÍA
    dayName: string    // DÍA DE LA SEMANA
    status: number      // 0: HOY;
                        // 1: NO HOY; 
                        // 2: PRIMER DÍA DEL MES
                        // 3: ULTIMO DÍA DEL MES
                        // -1: INACTIVO
    menu?: Menu         // MENU QUE ESTÉ REGISTRADO PARA ESE DÍA
    isWeekend: boolean  // ES FIN DE SEMANA
    validToAdd: boolean // DIA VALIDO PARA AGREGARSE
}