declare global {
    var glp_set_print_func: any;
    var glp_create_prob: any;
    var glp_read_lp_from_string: any;
    var glp_scale_prob: any;
    var SMCP: any;
    var GLP_ON: any;
    var GLP_SF_AUTO: any;
    var glp_simplex: any;
    var glp_intopt: any;
    var glp_get_obj_val: any;
    var glp_mip_obj_val: any;
    var glp_get_num_cols: any;
    var glp_get_col_name: any;
    var glp_mip_col_val: any;
    var glp_get_col_prim: any;
}
export {};
