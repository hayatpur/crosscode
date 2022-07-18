fun f 
    { n : int | n >= 1 } 
    (i : int n) : double =
  let
    fun loop 
        { n : int | n >= 1 } 
        .<n>.
        (acc : double, i : int (n)) : double =
      case- i of
      | 1 => acc
      | i when i > 1 => loop(acc * i, i - 1)
  in
    loop(1.0, i)
  end
