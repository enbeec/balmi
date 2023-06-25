import { AlpineComponent } from "alpinejs";

export const Border = (): AlpineComponent => {
    const defaultBorderColor= 'bg-slate-300';
    return {
        defaultBorderColor,
        onSet(command: { setBg?: string }){
            const { setBg } = command;
            if (setBg && CSS.supports('background', setBg))
                if (setBg === 'unset') this.borderEl().style.background = '';
                else this.borderEl().style.background = setBg;
        },
        borderEl() {
            return this.$refs.border as HTMLDivElement;
        },
        log(a: any) {
            console.log(a);
        }
    }
}