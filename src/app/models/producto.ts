export class producto {
    constructor(
        public nombre: string,
        public descripcion: string,
        public precio: string,
        public stock: string,
        public imagp: string | undefined,
        public idusuario: number | undefined,
    ) {}
}
